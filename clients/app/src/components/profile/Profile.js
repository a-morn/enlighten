import React, { useContext } from 'react'
import { store } from 'hooks/context/store.js'

export function Profile() {
  const {
    state: { profilePictureUrl, playerEmail },
  } = useContext(store)
  return (
    <section
      className={`rounded p-4 bg-white w-full`}
      style={{ minWidth: '200px' }}
    >
      <h1 className={`pb-10 text-2xl text-brand`}>Profile</h1>
      {profilePictureUrl && (
        <img
          alt="Profile pic"
          className="h-32 m-auto pb-10"
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
