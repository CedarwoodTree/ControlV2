import crypto from 'crypto';

/*
  Module Interacts with the Govee API
  -----------------------------------
 */
class GoveeHandler {
  static async insertDeviceStatus(devices, token) {
    if (!devices) {
      return;
    }

    const statusURL = 'https://openapi.api.govee.com/router/api/v1/device/state';
    const devicesImplementStatus = {};

    try {
      for (const [id, info] of Object.entries(devices)) {
        if (info?.type && info.type === 'devices.types.light') {
          const payload = {
            sku: info.sku || '',
            device: id || '',
          };

          const body = {
            requestId: crypto.randomUUID(),
            payload,
          };

          const response = await fetch(statusURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Govee-API-Key': token,
            },
            body: JSON.stringify(body),
          });

          if (response && response.ok) {
            const responseData = await response.json();

            let deviceStatus = {};

            if (responseData && responseData?.payload?.capabilities) {
              for (let capability of responseData?.payload.capabilities) {
                deviceStatus[capability?.instance] = {
                  value: capability?.state?.value || 0,
                };
                // console.log(capability)
              }
            }

            devicesImplementStatus[id] = {
              deviceName: info.deviceName,
              sku: info.sku,
              type: info.type,
              status: deviceStatus || {},
            };
          }
        }
      }

      return devicesImplementStatus;
    } catch (e) {
      console.log(e);
    }
  }

  /*
    List Devices
    ------------
    Grabs device list for token
   */
  static async listDevices(token) {
    const apiUrl = 'https://openapi.api.govee.com/router/api/v1/user/devices';
    const res = await fetch(apiUrl, {
      headers: {
        'Govee-API-Key': token,
        'Content-Type': 'application/json',
      },
    });

    if (res && res.ok) {
      const rawData = await res.json();

      const SimplifiedList = {};

      for (const device of rawData.data) {
        SimplifiedList[device.device] = {
          deviceName: device.deviceName,
          sku: device.sku,
          type: device.type,
        };
      }

      // WHERE I CAN EXCHANGE FOR DATABASE VALUE ( LET USER DECIDE
      // if (process.env.SHOWSTATUS) {
      //   // console.log(devicesWithStatus);
      //   return (await this.insertDeviceStatus(SimplifiedList)) || SimplifiedList;
      // }

      // console.log(SimplifiedList);

      return SimplifiedList;
    } else {
      console.log('Error fetching Govee devices');
    }
  }

  /*
    Toggle Device
    -------------
    Toggles the device power state
   */
  static async toggleDevice(device, token, db = false) {
    if (!device) {
      return;
    }

    const apiUrl = 'https://openapi.api.govee.com/router/api/v1/device/control';

    const payload = {
      sku: device.sku || '',
      device: device.id || '',
      capability: {
        type: 'devices.capabilities.on_off',
        instance: 'powerSwitch',
        value: 0,
      },
    };

    if (db) {
      payload.capability.value = 1;
    }

    try {
      const body = {
        requestId: crypto.randomUUID(),
        payload,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Govee-API-Key': token,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        // const result = await response.json();
        // console.log("LIGHT TOGGLED");
        // console.log(result);
        return true;
      }
    } catch (e) {
      console.log(e);
    }
  }
}

export default GoveeHandler;
