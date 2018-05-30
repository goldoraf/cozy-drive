import React, { Component } from 'react'
import createReactContext from 'create-react-context'
import { Query } from 'cozy-client'

import reducer, {
  receiveSharings,
  addSharing,
  revokeRecipient,
  revokeSelf,
  isOwner,
  getOwner,
  getRecipients,
  getSharingForRecipient,
  getSharingForSelf,
  getSharingType
} from './state'

import { default as DumbSharedBadge } from './components/SharedBadge'
import {
  default as DumbShareButton,
  SharedByMeButton,
  SharedWithMeButton
} from './components/ShareButton'
import { default as DumbShareModal } from './ShareModal'
import { SharingDetailsModal } from './SharingDetailsModal'

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

export { default as SharingDetailsModal } from './SharingDetailsModal'

const SharingContext = createReactContext()

export default class SharingProvider extends Component {
  constructor(props, context) {
    super(props, context)
    this.state = {
      byDocId: {},
      sharings: [],
      documentType: props.documentType || 'Document',
      isOwner: docId => isOwner(this.state, docId),
      getOwner: docId => getOwner(this.state, docId),
      getSharingType: docId => getSharingType(this.state, docId),
      getRecipients: docId => getRecipients(this.state, docId),
      share: this.share,
      revoke: this.revoke,
      revokeSelf: this.revokeSelf
    }
  }

  dispatch = action =>
    this.setState(state => ({ ...state, ...reducer(state, action) }))

  componentDidMount() {
    this.context.client
      .collection('io.cozy.sharings')
      .findByDoctype(this.props.doctype)
      .then(resp => this.dispatch(receiveSharings(resp.data)))
  }

  share = async (document, recipients, sharingType, description) => {
    const resp = await this.context.client
      .collection('io.cozy.sharings')
      .share(document, recipients, sharingType, description)
    this.dispatch(addSharing(resp.data))
    return resp.data
  }

  revoke = async (document, recipientEmail) => {
    const sharing = getSharingForRecipient(
      this.state,
      document.id,
      recipientEmail
    )
    await this.context.client
      .collection('io.cozy.sharings')
      .revokeRecipient(sharing, recipientEmail)
    this.dispatch(revokeRecipient(sharing, recipientEmail))
  }

  revokeSelf = async document => {
    const sharing = getSharingForSelf(this.state, document.id)
    await this.context.client.collection('io.cozy.sharings').revokeSelf(sharing)
    this.dispatch(revokeSelf(sharing))
  }

  render() {
    // WARN: whe shouldn't do this (https://reactjs.org/docs/context.html#caveats)
    // but if we don't, consumers don't rerender when the state changes after loading the sharings,
    // probably because the state object remains the same...
    return (
      <SharingContext.Provider value={{ ...this.state }}>
        {this.props.children}
      </SharingContext.Provider>
    )
  }
}

export const SharedBadge = ({ docId, ...rest }) => (
  <SharingContext.Consumer>
    {({ byDocId, isOwner }) => {
      return !byDocId[docId] ? null : (
        <DumbSharedBadge byMe={isOwner(docId)} {...rest} />
      )
    }}}
  </SharingContext.Consumer>
)

export const ShareButton = ({ docId, ...rest }, { t }) => (
  <SharingContext.Consumer>
    {({ byDocId, documentType, isOwner }) =>
      !byDocId[docId] ? (
        <DumbShareButton label={t(`${documentType}.share.cta`)} {...rest} />
      ) : isOwner(docId) ? (
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

const OwnerSharingModal = ({ document, ...rest }) => (
  <SharingContext.Consumer>
    {({ documentType, getRecipients, share, revoke }) => (
      <Query query={cozy => cozy.all('io.cozy.contacts')}>
        {({ data }, { createDocument: createContact }) => (
          <DumbShareModal
            document={document}
            documentType={documentType}
            contacts={data}
            createContact={createContact}
            recipients={getRecipients(document.id)}
            onShare={share}
            onRevoke={revoke}
            {...rest}
          />
        )}
      </Query>
    )}
  </SharingContext.Consumer>
)

const SharingModal = ({ document, ...rest }) => (
  <SharingContext.Consumer>
    {({
      documentType,
      getOwner,
      getSharingType,
      getRecipients,
      revokeSelf
    }) => (
      <SharingDetailsModal
        document={document}
        documentType={documentType}
        owner={getOwner(document.id)}
        sharingType={getSharingType(document.id)}
        recipients={getRecipients(document.id)}
        onRevoke={revokeSelf}
        {...rest}
      />
    )}
  </SharingContext.Consumer>
)

export const ShareModal = ({ document, ...rest }) => (
  <SharingContext.Consumer>
    {({ byDocId, isOwner }) =>
      !byDocId[document.id] || isOwner(document.id) ? (
        <OwnerSharingModal document={document} {...rest} />
      ) : (
        <SharingModal document={document} {...rest} />
      )
    }
  </SharingContext.Consumer>
)
