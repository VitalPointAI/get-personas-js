To use:

1.  Create a persona using NEAR Personas or Catalyst (details coming soon)

In your app:

import Persona from '@aluhning/get-personas-js

const aPersona = new Persona()
let currentPersona = aPersona.getPersona(accountId)

where accountId is a NEAR account name.  You'll get an object of the Persona to use as you wish.  The data will change
if the owner of the Persona ever changes it.
