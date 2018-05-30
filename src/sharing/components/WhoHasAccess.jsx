import React from 'react'

import Recipient from './Recipient'

const WhoHasAccess = ({
  isOwner = false,
  recipients,
  document,
  documentType,
  onRevoke
}) => (
  <div>
    {recipients
      .filter(r => r.status !== 'revoked')
      .map(recipient => (
        <Recipient
          {...recipient}
          isOwner={isOwner}
          document={document}
          documentType={documentType}
          onRevoke={onRevoke}
        />
      ))}
  </div>
)

export default WhoHasAccess
