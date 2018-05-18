import React, { Component } from 'react'
import createReactContext from 'create-react-context'
import { Query } from 'cozy-client'

import { default as DumbSharedBadge } from './components/SharedBadge'
import {
  default as DumbShareButton,
  SharedByMeButton,
  SharedWithMeButton
} from './components/ShareButton'
import { default as DumbShareModal } from './ShareModal'

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
      shared: {},
      documentType: props.documentType || 'Document',
      isOwner: this.isOwner,
      getRecipients: this.getRecipients,
      share: this.share,
      revoke: this.revoke
    }
  }

  componentDidMount() {
    this.context.client
      .collection('io.cozy.sharings')
      .findByDoctype(this.props.doctype)
      .then(resp => this.indexSharings(resp.data))
  }

  isOwner = docId =>
    this.state.shared[docId][0] && this.state.shared[docId][0].owner === true

  getRecipients = docId => {
    const recipients = !this.state.shared[docId]
      ? []
      : this.state.shared[docId]
          .map(s => {
            const rule = s.rules.find(r => r.values.indexOf(docId) !== -1)
            const type =
              rule.update === 'sync' && rule.remove === 'sync'
                ? 'two-way'
                : 'one-way'
            return s.members.map(m => ({ ...m, type }))
          })
          .reduce((m, acc) => acc.concat(m), [])
    return recipients
  }

  share = async (document, recipients, sharingType, description) => {
    const resp = await this.context.client
      .collection('io.cozy.sharings')
      .share(document, recipients, sharingType, description)
    console.log(resp.data)
    return resp.data
  }

  revoke = () => {}

  collection(document) {
    return this.context.client.collection(document._type)
  }

  indexSharings(sharings) {
    let sharedDocs = {}
    sharings.forEach(s =>
      s.rules.forEach(r =>
        r.values.forEach(id => {
          if (sharedDocs[id]) {
            sharedDocs[id].push(s)
          } else {
            sharedDocs[id] = [s]
          }
        })
      )
    )
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
    {({ shared, isOwner }) =>
      !shared[docId] ? null : (
        <DumbSharedBadge byMe={isOwner(docId)} {...rest} />
      )
    }}
  </SharingContext.Consumer>
)

export const ShareButton = ({ docId, ...rest }, { t }) => (
  <SharingContext.Consumer>
    {({ shared, documentType, isOwner }) =>
      !shared[docId] ? (
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

export const ShareModal = ({ document, ...rest }) => (
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
