import React, { useContext, useEffect } from 'react'
import { store } from 'hooks/context/store.js'
import { withRouter } from 'react-router-dom'

function ProfileComponent({ history }) {
  const {
    state: { profilePictureUrl, playerEmail, token, isTempUser },
  } = useContext(store)

  useEffect(() => {
    if (!token || isTempUser) {
      history.push('/')
    }
  }, [token, isTempUser, history])

  return (
    <section
      className={`rounded p-4 bg-white w-full`}
      style={{ minWidth: '200px' }}
    >
      <h1 className={`pb-10 text-2xl text-brand`}>Profile</h1>
      {profilePictureUrl && (
        <img
          alt="Profile pic"
          className="h-32 m-auto pb-10 rounded"
          src={profilePictureUrl}
        />
      )}
      <div className="flex flex-row justify-between items-end">
        <label className="mr-8 text-xl">Email</label>
        {playerEmail && <span>{playerEmail}</span>}
      </div>
    </section>
  )
}

export const Profile = withRouter(ProfileComponent)
