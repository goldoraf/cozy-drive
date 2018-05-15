import React, { Component } from 'react'
import createReactContext from 'create-react-context'

import { default as DumbSharedBadge } from './components/SharedBadge'

const getPrimaryOrFirst = property => obj => {
  if (!obj[property] || obj[property].length === 0) return ''
  return obj[property].find(property => property.primary) || obj[property][0]
}

// TODO: sadly we have different versions of contacts' doctype to handle...
// A migration tool on the stack side is needed here
export const getPrimaryEmail = contact =>
  Array.isArray(contact.email)
    ? getPrimaryOrFirst('email')(contact).address
    : contact.email

export const getPrimaryCozy = contact =>
  Array.isArray(contact.cozy)
    ? getPrimaryOrFirst('cozy')(contact).url
    : contact.url

export { default as ShareModal } from './ShareModal'
export { default as SharingDetailsModal } from './SharingDetailsModal'

export {
  default as ShareButton,
  SharedByMeButton,
  SharedWithMeButton
} from './components/ShareButton'

const SharingContext = createReactContext()

export default class SharingProvider extends Component {
  state = {
    sharings: {}
  }

  componentDidMount() {
    this.context.client
      .collection('io.cozy.sharings')
      .findByDoctype(this.props.doctype)
      .then(resp => this.setState(state => ({ ...state, sharings: resp.data })))
  }

  render() {
    return (
      <SharingContext.Provider value={this.state}>
        {this.props.children}
      </SharingContext.Provider>
    )
  }
}

export const SharedBadge = ({ docId, ...rest }) => (
  <SharingContext.Consumer>
    {({ sharings }) => {
      const sharing = sharings.find(s =>
        s.attributes.rules.some(r => r.values.indexOf(docId) !== -1)
      )
      if (!sharing) return null
      return <DumbSharedBadge byMe={sharing.owner} {...rest} />
    }}
  </SharingContext.Consumer>
)
