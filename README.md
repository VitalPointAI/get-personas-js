![NEAR Personas](https://cdn.vitalpoint.ai/vitalpointai-cdn/2022/03/personas-title.png)

## Integrating NEAR Personas in your App ##

It's a simple process to bring NEAR Personas into your applications to use as you see fit.  It's basically a three step process:

1. install this NPM package
2. import the package and instantiate a Persona class
3. call a method, passing it the name of the NEAR account you want data for

### Step 1: Install the NPM Package ###

    yarn add @aluhning/get-personas-js

### Step 2: Import and Instantiate

    import Persona from '@aluhning/get-personas-js'
    ...
    let persona = new Persona()

### Step 3: Retrieve the Persona's Data

Be sure to call this inside an async function (so await works):

    let personaData = await persona.getData('profile', accountId)

'profile' - is the alias of the Ceramic data stream definition storing the persona data.  Don't change this if you're wanting the data that people are managing using NEAR Personas.

accountId - is the string representation of the NEAR account you want data for.

### The Result ###

personaData will contain an object similar to the following which you can use as you need to in your application.

![NEAR Persona Data Object](https://cdn.vitalpoint.ai/vitalpointai-cdn/2022/03/persona-object.png)

Enjoy.
