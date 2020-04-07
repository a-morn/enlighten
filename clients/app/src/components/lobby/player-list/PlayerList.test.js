import React from 'react'
import ReactDOM from 'react-dom'
import PlayerList from './PlayerList'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<PlayerList />, div)
  ReactDOM.unmountComponentAtNode(div)
})
