import React from 'react'
import ReactDOM from 'react-dom'
import GameRequestModal from './GameRequestModal'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<GameRequestModal />, div)
  ReactDOM.unmountComponentAtNode(div)
})
