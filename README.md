# Control V2

This is a basic webpage designed to communicate with the Govee API to toggle the power status of light devices.


## Some more info

This project caches devices in sqlite to reduce the amount of times the Govee API is used.

This webpage also has:

- Multi-Key Configuration
- Automatic 24-hour refresh of Devices
- A responsive UI
- A lightweight design
- Docker Compatability


### Example ``docker-compose``:

```yaml
services:
  controlv2:
    image: ghcr.io/cedarwoodtree/controlv2:latest
    container_name: controlv2
    restart: unless-stopped
    ports:
      - "4000:4000"
    environment:
      APP_ENV: "production"
    volumes:
      - ./data:/app/data
```


## Project Setup (Non-Docker)

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
