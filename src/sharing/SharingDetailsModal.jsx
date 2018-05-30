import styles from './share.styl'

import React, { Component } from 'react'
import { UserAvatar as Owner } from './components/Recipient'
import WhoHasAccess from './components/WhoHasAccess'

import Modal from 'cozy-ui/react/Modal'

export class SharingDetailsModal extends Component {
  render() {
    const { t, f } = this.context
    const {
      onClose,
      sharingType,
      owner,
      recipients,
      document,
      documentType = 'Document',
      onRevoke
    } = this.props
    return (
      <Modal
        title={t(`${documentType}.share.details.title`)}
        secondaryAction={onClose}
        className={styles['share-modal']}
        into="body"
      >
        <div className={styles['share-modal-content']}>
          <Owner
            name={t(`${documentType}.share.sharedWithMe`)}
            url={owner.instance}
          />
          <div className={styles['share-details-created']}>
            {t(`${documentType}.share.details.createdAt`, {
              date: f(document.created_at || null, 'Do MMMM YYYY')
            })}
          </div>
          <div className={styles['share-details-perm']}>
            {t(
              `${documentType}.share.details.${
                sharingType === 'one-way' ? 'ro' : 'rw'
              }`
            )}
          </div>
          <WhoHasAccess
            recipients={recipients}
            document={document}
            documentType={documentType}
            onRevoke={onRevoke}
          />
        </div>
      </Modal>
    )
  }
}
