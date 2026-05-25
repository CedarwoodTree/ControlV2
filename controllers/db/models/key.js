import db from '../db.js';

class Key {
  static async getKeys() {
    try {
      const rows = db.prepare('SELECT key_id, name, last_used FROM key').all();

      if (rows.length > 0 && Array.isArray(rows)) {
        return rows;
      }
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  static async createKey(options = {}) {
    const params = Object.assign(
      {
        content: null,
        name: null,
        last_used: Date.now(),
      },
      options
    );

    if (!params.content || !params.name || params.content.length <= 1) {
      return;
    }

    try {
      const insertKey = db.prepare(
        `INSERT INTO key (content, name,  last_used) VALUES (?, ?, ?)`
      );
      insertKey.run(params.content, params.name, params.last_used);
      return true;
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  static async deleteKey(options = {}) {
    const params = Object.assign(
      {
        key_id: null,
      },
      options
    );

    if (!params.key_id || isNaN(params.key_id)) {
      return;
    }

    try {
      const deleteKey = db.prepare(`DELETE FROM key WHERE key_id = ? LIMIT 1`);
      deleteKey.run(params.key_id);

      // Also delete devicelists
      const deleteDevices = db.prepare(`DELETE FROM devicelist WHERE key_id = ?`);
      deleteDevices.run(params.key_id);

      return true;
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  /*
    Find Key
    --------
    Returns key from db based on key_id OR ``null``
   */
  static async findOne(key_id) {
    if (!key_id || isNaN(key_id)) {
      return;
    }

    try {
      // Query db
      const rows = db.prepare('SELECT * FROM key WHERE key_id = ? LIMIT 1').all(key_id);

      // Validate return data
      if (rows && Array.isArray(rows) && rows.length > 0) {
        return rows;
      }
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }
}

export default Key;
