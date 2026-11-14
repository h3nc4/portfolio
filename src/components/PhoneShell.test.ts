// @vitest-environment node
import { within } from '@testing-library/dom'

import PhoneShell from '@/components/PhoneShell.astro'
import { render } from '@/test/astro'

describe('PhoneShell', () => {
  it('shows its content on the screen', async () => {
    const body = await render(PhoneShell, {
      slots: { default: '<img src="shot.webp" alt="A screen">' },
    })

    expect(within(body).getByRole('img', { name: 'A screen' })).toBeInTheDocument()
  })

  it('draws the badge content inside the pill above the handset', async () => {
    const body = await render(PhoneShell, { slots: { badge: '<span>Screens</span>' } })

    expect(within(body).getByTestId('phone-badge')).toContainElement(
      within(body).getByText('Screens'),
    )
  })

  it('applies class names to the container and the screen', async () => {
    const body = await render(PhoneShell, {
      props: { class: 'custom-class', screenClass: 'screen-class' },
      slots: { default: '<span>inside</span>' },
    })

    expect(within(body).getByTestId('device-frame-container')).toHaveClass('custom-class')
    expect(within(body).getByText('inside').parentElement).toHaveClass('screen-class')
  })

  it('passes data attributes on to the container', async () => {
    const body = await render(PhoneShell, { props: { 'data-screens': true } })

    expect(within(body).getByTestId('device-frame-container')).toHaveAttribute('data-screens')
  })
})
