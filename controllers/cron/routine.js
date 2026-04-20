import db from '../db/db.js';
import Key from '../db/models/key.js';
import Devicelist from '../db/models/devicelist.js';
import GoveeHandler from '../GoveeHandler.js';
import cron from 'node-cron';

async function refreshDevicelists() {
  console.log('- Refreshing Devices -');
  const keys = await Key.getKeys();

  if (!Array.isArray(keys)) {
    return;
  }

  try {
    for (const key of keys) {
      const keyContentQuery = db
        .prepare('SELECT content FROM key WHERE key_id = ?')
        .all(key.key_id);

      const keyContent = keyContentQuery[0]?.content;

      if (!keyContent) {
        continue;
      }

      // Update last used record for key
      const res = db
        .prepare('UPDATE key SET last_used = ? WHERE key_id = ? LIMIT 1')
        .run(Date.now(), key.key_id);

      const devices = await GoveeHandler.listDevices(keyContent);

      if (devices && typeof devices === 'object') {
        await Devicelist.upsertDeviceList({
          key_id: key.key_id,
          content: devices,
        });
      }
    }

    return true;
  } catch (e) {
    if (process.env.APP_ENV === 'development') {
      console.log(e);
    }
  }
}

// Daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily cron at midnight...');

  try {
    await refreshDevicelists();
  } catch (error) {
    console.error('Daily cron failed:', error);
  }
});

export { refreshDevicelists };
