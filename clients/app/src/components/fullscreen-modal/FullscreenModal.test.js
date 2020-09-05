import { render } from '@testing-library/react'
import React from 'react'
import FullscreenModal from './FullscreenModal'

const texts = {
  title: 'How are you doing?',
  body: 'Good or bad?',
  acceptText: 'Great!',
  declineText: 'Shitty :(',
}

test('displays text', () => {
  const { getByText } = render(
    <FullscreenModal
      title={texts.title}
      body={texts.body}
      acceptText={texts.acceptText}
      declineText={texts.declineText}
    />,
  )

  for (const text of Object.values(texts)) {
    expect(getByText(text)).toBeInTheDocument()
  }
})
