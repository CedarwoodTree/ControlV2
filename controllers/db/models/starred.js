import db from '../db.js';
import Key from '../models/key.js';

class Starred {
  /*
    Find All Starred
    ----------------
    Returns all starred associated with a key_id
   */
  static async findAll(key_id) {
    if (!key_id || isNaN(key_id)) {
      return;
    }

    try {
      const rows = db.prepare(`SELECT * FROM starred WHERE key_id = ?`).all(key_id);

      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows;
      }
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  /*
    Find Starred
    ------------
    Returns starred device or null

    @params ``device_id`` -> device MAC
   */
  static async findOne(device_id) {
    if (!device_id || device_id.length < 1) {
      return;
    }

    try {
      const rows = db.prepare('SELECT * FROM starred WHERE device_id=? LIMIT 1').all();
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows;
      }
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  /*
    Upsert Starred
    --------------
    Inserts or updates a starred device within the database.

    For now, I'll use a device's MAC as it's unique grouping identifier.

    @params ```json
    options={
      key_id: Number
      device_id: Number
    }
    ```

    Returns ``boolean`` or ``null``
   */
  static async insert(options = {}) {
    const params = Object.assign(
      {
        key_id: null,
        device_id: null,
        timestamp: Date.now(),
      },
      options
    );

    try {
      // Validate Params
      if (!params.key_id || isNaN(params.key_id) || !params.device_id) {
        return;
      }

      // Check for key in DB
      const k = await Key.findOne(params.key_id);

      // Loosely Validate Key
      if (!k || !Array.isArray(k) || k.length < 1 || !k[0].content) {
        return;
      }

      // Insert star into db
      const stmt = db.prepare(
        'INSERT INTO starred (key_id, device_id, last_updated) VALUES (?, ?, ?)'
      );
      const result = stmt.run(params.key_id, params.device_id, params.timestamp);

      if (result && result.changes >= 1) {
        return true;
      }
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  static async delete(device_id) {
    if (!device_id || device_id.length < 1) {
      return;
    }

    try {
      const stmt = db.prepare('DELETE FROM starred WHERE device_id=? LIMIT 1');
      const result = stmt.run(device_id);

      if (result && result.changes >= 1) {
        return true;
      }
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }
}

export default Starred;
