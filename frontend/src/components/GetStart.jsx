import React from 'react';
import { useClerk, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

const NewsletterBox = () => {
  const { openSignIn } = useClerk();
  const { user } = useUser();
  const navigate = useNavigate();

  const onSubmitHandler = (event) => {
    event.preventDefault();

    if (user) {
      // If logged in, navigate to /workflow
      navigate('/bunk-tracker');
    } else {
      // If not logged in, open Clerk sign-in
      openSignIn();
    }
  };

  return (
    <div className="w-full flex justify-center px-4 py-20 bg-gray-950">
      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex justify-center"
      >
        <br />
        <br />
        <button
          type="submit"
          className="bg-green-600 text-white text-base sm:text-lg md:text-xl px-8 sm:px-10 py-3 sm:py-4 rounded cursor-pointer"
        >
          GET STARTED
        </button>
        <br />
        <br />
      </form>
    </div>
  );
};

export default NewsletterBox;
