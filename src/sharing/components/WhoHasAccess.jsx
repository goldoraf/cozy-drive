import React from 'react'

import Recipient from './Recipient'

const WhoHasAccess = ({ recipients, document, documentType, onUnshare }) => (
  <div>
    {recipients
      .filter(r => r.status !== 'revoked')
      .map(recipient => (
        <Recipient
          {...recipient}
          document={document}
          documentType={documentType}
          onUnshare={onUnshare}
        />
      ))}
  </div>
)

export default WhoHasAccess
