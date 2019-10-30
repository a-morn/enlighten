import React from 'react'
import ReactDOM from 'react-dom'
import StartGame from './StartGame'

it('renders without crashing', () => {
  const div = document.createElement('div')
  ReactDOM.render(<StartGame />, div)
  ReactDOM.unmountComponentAtNode(div)
})
