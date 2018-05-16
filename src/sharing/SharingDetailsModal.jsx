import styles from './share.styl'

import React, { Component } from 'react'
import { UserAvatar } from './components/Recipient'
import Modal from 'cozy-ui/react/Modal'

const Owner = UserAvatar

export class SharingDetailsModal extends Component {
  render() {
    const { t, f } = this.context
    const { onClose, sharing, document, documentType = 'Document' } = this.props
    return (
      <Modal
        title={t(`${documentType}.share.details.title`)}
        secondaryAction={onClose}
        into="body"
      >
        <div className={styles['pho-share-modal-content']}>
          <Owner
            name={t(`${documentType}.share.sharedWithMe`)}
            url={sharing.sharer.url}
          />
          <div className={styles['pho-share-details-created']}>
            {t(`${documentType}.share.details.createdAt`, {
              date: f(document.created_at || null, 'Do MMMM YYYY')
            })}
          </div>
          <div className={styles['pho-share-details-perm']}>
            {t(
              `${documentType}.share.details.${
                sharing.sharingType === 'one-way' ? 'ro' : 'rw'
              }`
            )}
          </div>
        </div>
      </Modal>
    )
  }
}
