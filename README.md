# Control V2 (aegon)

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
  control:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: control
    restart: unless-stopped
    ports:
      - "4000:4000"
    env_file:
      - .env
    volumes:
      - .:/app
      - /app/node_modules
      - /app/dist

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
