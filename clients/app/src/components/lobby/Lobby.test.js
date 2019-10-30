import React from 'react'
import ReactDOM from 'react-dom'
import Lobby from './Lobby'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<Lobby />, div)
  ReactDOM.unmountComponentAtNode(div)
})
