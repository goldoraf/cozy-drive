import React from 'react'

import Recipient from './Recipient'

const WhoHasAccess = ({ recipients, documentType, onUnshare }) => (
  <div>
    {recipients
      .filter(r => r.status !== 'revoked')
      .map(recipient => (
        <Recipient
          {...recipient}
          documentType={documentType}
          onUnshare={onUnshare}
        />
      ))}
  </div>
)

export default WhoHasAccess
