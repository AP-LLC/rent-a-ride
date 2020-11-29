import React from 'react'
import App from '../App'
import { shallow } from 'enzyme'

// TODO write more tests

describe('rendering components', () => {
  it('renders App component without crashing', () => {
    shallow(<App/>)
  })
  it('renders App component header without crashing', () => {
    const wrapper = shallow(<App/>)
    const header = (<h1>This is Rent-a-Ride, enjoy!</h1>)
    expect(wrapper.contains(header)).toEqual(true)
  })
})
