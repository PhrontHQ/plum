# PlumAppointments Readme

To run PlumAppointments locally, follow these steps:

Before running into project's specifics you need node/npm installed. Download the LTS version from https://nodejs.org/en/download/ 12.x . Installing node that way installs npm as well.

Once node is installed, install the http-server package (https://www.npmjs.com/package/http-server) by running in terminal:

npm install http-server.



1. Clone the plum-phront [GitHub repo](https://github.com/PhrontHQ/plum-appointments) in your desktop.
```
git clone https://github.com/PhrontHQ/plum-appointments.git
```

2. Install Node modules dependencies
```
npm install
```

3. use http-server (for example:  http-server -p 8383 . ) or Spin up your preferred HTTP server and point your browser to the associated port to serve the PlumPhront directory. Info about http-server options at https://www.npmjs.com/package/http-server 


#Generate a key and certificate, from the project's folder:

See https://deliciousbrains.com/ssl-certificate-authority-for-local-https-development/

1. Generate a Root certificate
    openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout dev/key.pem -out dev/cert.pem

You will be prompted with a few questions after entering the command. Use phront.local as value for Common name if you want to be able to install the certificate in your OS's root certificate store or browser so that it is trusted.

This generates a cert-key pair and it will be valid for 3650 days (about 10 years).

Then you need to run the server with -S for enabling SSL and -C for your certificate file.

2. Adding the Root Certificate to macOS Keychain

sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" dev/cert.pem

3. Share by email cert.pem to all devices 

4. openssl x509 -req -in phront.local.csr -CA cert.pem -CAkey key.pem -CAcreateserial \
-out phront.local.crt -days 825 -sha256 -extfile phront.local.ext

