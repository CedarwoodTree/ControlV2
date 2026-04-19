import { Router } from 'express';
import { refreshDevicelists } from '../controllers/cron/routine.js';
import Key from '../controllers/db/models/key.js';
import Devicelist from '../controllers/db/models/devicelist.js';
import GoveeHandler from '../controllers/GoveeHandler.js';
import db from '../controllers/db/db.js';

const router = Router();

/*
  Key Routes
 */

router.get('/get-keys', async (req, res) => {
  try {
    const keys = await Key.getKeys();
    if (keys) {
      return res.json(keys);
    }
    return res.sendStatus(500);
  } catch (e) {
    if (process.env.APP_ENV === 'development') {
      console.log(e);
    }
    return res.sendStatus(500);
  }
});

router.post('/create-key', async (req, res) => {
  try {
    const RequestName = req.body.name ? req.body.name.toString().trim() : null;
    const RequestContent = req.body.content ? req.body.content.toString().trim() : null;

    const insertResult = await Key.createKey({
      name: RequestName,
      content: RequestContent,
    });

    if (insertResult) {
      await refreshDevicelists();
      return res.sendStatus(200); // 200 Key Created
    } else {
      return res.sendStatus(400);
    }
  } catch (e) {
    if (process.env.APP_ENV === 'development') {
      console.log(e);
      return res.sendStatus(500);
    }
  }
});

router.post('/delete-key', async (req, res) => {
  try {
    const RequestKey = req.body.key_id ? req.body.key_id : null;

    if (!RequestKey || isNaN(RequestKey)) {
      return res.sendStatus(400);
    }

    const deleteResult = await Key.deleteKey({
      key_id: RequestKey,
    });

    if (deleteResult) {
      return res.sendStatus(200); // 200 Key Deleted
    } else {
      return res.sendStatus(500);
    }
  } catch (e) {
    if (process.env.APP_ENV === 'development') {
      console.log(e);
    }
    return res.sendStatus(500);
  }
});

/*
  Device Routes
 */

router.get('/devices/:id', async (req, res) => {
  const requestID = req.params.id ? req.params.id : null;

  if (!requestID || isNaN(requestID)) {
    return res.sendStatus(400);
  }

  try {
    const devices = await Devicelist.getDeviceList(Number(requestID));

    if (devices && Array.isArray(devices)) {
      return res.json(devices); // 200 Return JSON
    } else {
      return res.sendStatus(500);
    }
  } catch (e) {
    if (process.env.APP_ENV === 'development') {
      console.log(e);
    }
    return res.sendStatus(500);
  }
});

router.post('/toggle-device', async (req, res) => {
  const device = req.body.device_id;
  const sku = req.body.sku;
  const dbo = req.body.db ? req.body.db : false;
  const key_id = req.body.key_id;

  if (!device || !sku || !key_id || isNaN(key_id)) {
    return res.sendStatus(400);
  }

  try {
    const payload = {
      sku: sku,
      id: device,
    };

    // Must get key
    const key = db
      .prepare('SELECT content FROM key WHERE key_id = ? LIMIT 1')
      .all(key_id);

    if (key && Array.isArray(key) && key[0]?.content) {
      const result = await GoveeHandler.toggleDevice(payload, key[0].content, dbo);

      if (result) {
        return res.sendStatus(200); // 200 Device Toggled
      } else {
        return res.sendStatus(500);
      }
    } else {
      return res.sendStatus(500);
    }
  } catch (e) {
    if (process.env.APP_ENV === 'development') {
      console.log(e);
    }
    return res.sendStatus(500);
  }
});

router.get('/refresh-devices', async (req, res) => {
  try {
    const result = await refreshDevicelists();

    if (result) {
      return res.sendStatus(200);
    }

    return res.sendStatus(500);
  } catch (e) {
    if (process.env.APP_ENV === 'development') {
      console.log(e);
    }
    return res.sendStatus(500);
  }
});

export default router;
