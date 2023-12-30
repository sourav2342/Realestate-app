import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from 'firebase/storage';
import { app } from "../firebase";
import { useDispatch } from 'react-redux';
import { deleteUserFailure, deleteUserStart, deleteUserSuccess, signoutUserFailure, signoutUserStart, signoutUserSuccess, updateUserFailure, updateUserStart, updateUserSuccess } from "../redux/userSlice";
import {Link } from "react-router-dom";
// allow read;
// allow write: if 
// request.resource.size < 2 * 1024 * 1024 && 
// request.resource.contentType.matches('images/.*')


export default function Profile() {
  const fileRef = useRef(null);
  const {currentUser, loading, error } = useSelector((state) => state.user)
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [showListingError, setShowListingsError] = useState(false);
  const [userListing, setUserListing] = useState([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData]  = useState({});
  const dispatch = useDispatch();

  useEffect( () => {
    if(file) {
      handleFileUpload(file);
    }
  },[file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error)=>{
        setFileUploadError(true);
      },
      ()=>{
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL)=> 
          setFormData({...formData, avatar: downloadURL})
        );
      }
    )
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      console.log('start');
      const res = await fetch(`/api/user/update/${currentUser._id}`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      console.log('data');
      if(data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      console.log('success');

    } catch (error) {
       dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async () =>{
      try {
        
        dispatch(deleteUserStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if(data.success === false) {
          dispatch(deleteUserFailure(data.message));
          return;
        }
        dispatch(deleteUserSuccess(data));
      } catch (error) {
        dispatch(deleteUserFailure(error.message));
      }
  }
  

  const handleSignOut = async () => {
      try {

        dispatch(signoutUserStart());
        const res = await fetch(`/api/auth/signout`, {
          method: 'GET',
        });
        const data = await res.json();
        if(data.success === false) {
          dispatch(signoutUserFailure(data.message));
        }
        dispatch(signoutUserSuccess(data));
      } catch (error) {
        dispatch(signoutUserFailure(error.message));
      }
  }

  const handleShowListings = async () => {
      try {
        setShowListingsError(false);
        const res = await fetch(`/api/user/listings/${currentUser._id}`);
        const data = await res.json();
        //console.log(data)
        setUserListing(data);
        if (data.success === false) {
          setShowListingsError(true);
          return;
        }
      } catch (error) {
        setShowListingsError(true);
      }
  };



  return (
    <div className="p-3 max-w-lg mx-auto gap-4">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input onChange={(e)=> setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*"/>
        <img onClick={()=> fileRef.current.click()} 
             src={formData.avatar || currentUser.avatar} 
             alt="profile" 
             className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2"
        />
        {/* <p>
          {fileUploadError ? <span className="text-red-700">error image uploading</span>: ""}
        </p> */}
        <input type="text" onChange={handleChange} placeholder="username" defaultValue={currentUser.username} id='username' className="border p-3 rounded-lg" />
        <input type="email" onChange={handleChange} placeholder="email" defaultValue={currentUser.email} id='email' className="border p-3 rounded-lg" />
        <input type="text" onChange={handleChange}  placeholder="password"  id='password' className="border p-3 rounded-lg" />
        <button className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">Update</button>
        <Link className="bg-green-700 text-white p-3 uppercase text-center rounded-lg hover:opacity-95" to={"/create-listing"}>create Listing</Link>
      </form>

      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete Account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">SignOut</span>
      </div>
      {updateSuccess ? <p className="text-green-700 mt-5">success</p>: <></>}
      <button  onClick={handleShowListings} className="text-green-700 w-full ">Show Listings</button>
      <p className="text-red-700 mt-5">{showListingError ? 'Error showing listings': '' }</p>
      {userListing && userListing.length > 0 && 
        userListing.map((listing) => (
           <div key={listing._id} className="border rounded-lg p-3 mb-1 flex justify-between items-center gap-4">
             <Link to={`/listings/${listing._id}`}>
              <img src={listing.imageUrls[0]} alt="listing cover" className="h-16 w-16 object-contain " />
             </Link>
             <Link className="flex-1 text-slate-700 font-semibold  hover:underline truncate" to={`/listings/${listing._id}`}>
              <p>{listing.name}</p>
             </Link>
             <div className="flex flex-col ">
                <button className="text-red-700 uppercase">
                  Delete
                </button>
                <button className="text-red-700 uppercase">
                  Edit
                </button>
             </div>

           </div>
        ))
      }
    </div>
  )
}
