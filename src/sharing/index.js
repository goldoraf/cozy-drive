import React, { Component } from 'react'
import createReactContext from 'create-react-context'

import { default as DumbSharedBadge } from './components/SharedBadge'
import {
  default as DumbShareButton,
  SharedByMeButton,
  SharedWithMeButton
} from './components/ShareButton'

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

const SharingContext = createReactContext()

export default class SharingProvider extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      shared: {},
      documentType: props.documentType || 'Document'
    }
  }

  componentDidMount() {
    this.context.client
      .collection('io.cozy.sharings')
      .findByDoctype(this.props.doctype)
      .then(resp => this.indexSharings(resp.data))
  }

  indexSharings(sharings) {
    let sharedDocs = {}
    sharings.forEach(s =>
      s.attributes.rules.forEach(r =>
        r.values.forEach(id => (sharedDocs[id] = s))
      )
    )
    console.log(sharedDocs)
    this.setState(state => ({
      ...state,
      shared: { ...state.shared, ...sharedDocs }
    }))
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
    {({ shared }) =>
      !shared[docId] ? null : (
        <DumbSharedBadge byMe={shared[docId].owner} {...rest} />
      )
    }}
  </SharingContext.Consumer>
)

export const ShareButton = ({ docId, ...rest }, { t }) => (
  <SharingContext.Consumer>
    {({ shared, documentType }) =>
      !shared[docId] ? (
        <DumbShareButton label={t(`${documentType}.share.cta`)} {...rest} />
      ) : shared[docId].owner ? (
        <SharedByMeButton
          label={t(`${documentType}.share.sharedByMe`)}
          {...rest}
        />
      ) : (
        <SharedWithMeButton
          label={t(`${documentType}.share.sharedWithMe`)}
          {...rest}
        />
      )
    }
  </SharingContext.Consumer>
)
