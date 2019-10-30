import React from 'react'
import ReactDOM from 'react-dom'
import SingleplayerGame from './SingleplayerGame'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<SingleplayerGame />, div)
  ReactDOM.unmountComponentAtNode(div)
})
