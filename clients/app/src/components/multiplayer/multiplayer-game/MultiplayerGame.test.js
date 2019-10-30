import React from 'react'
import ReactDOM from 'react-dom'
import MultiplayerGame from './MultiplayerGame'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<MultiplayerGame />, div)
  ReactDOM.unmountComponentAtNode(div)
})
