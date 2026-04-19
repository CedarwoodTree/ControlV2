import db from '../db.js';

class DeviceList {
  static async getDeviceList(key_id) {
    if (!key_id || isNaN(key_id)) {
      return [];
    }

    try {
      const rows = db
        .prepare('SELECT * FROM devicelist WHERE devicelist_id = ? LIMIT 1')
        .all(key_id);

      return rows || [];
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  static async deleteDeviceList(key_id) {
    if (!key_id || isNaN(key_id)) {
      return;
    }

    try {
      const query = db.prepare(`DELETE FROM devicelist WHERE key_id = ? LIMIT 1`);
      query.run(key_id);
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }

  static async upsertDeviceList(options = {}) {
    const params = Object.assign(
      {
        key_id: null,
        content: {},
        last_updated: Date.now(),
      },
      options
    );

    if (!params.key_id || isNaN(params.key_id)) {
      return;
    }

    // Parse into JSON string
    params.content = JSON.stringify(params.content);

    try {
      // Upsert

      const rowExistsQuery = db
        .prepare('SELECT COUNT(*) FROM devicelist WHERE key_id = ?')
        .all(params.key_id);

      // console.log(rowExistsQuery);

      // Row Doesn't Exist, Insert
      if (
        rowExistsQuery &&
        rowExistsQuery.length > 0 &&
        rowExistsQuery[0]['COUNT(*)'] < 1
      ) {
        const insertRow = db.prepare(
          'INSERT INTO devicelist (key_id, content, last_updated) VALUES (?, ?, ?)'
        );

        insertRow.run(params.key_id, params.content, params.last_updated);
        // console.log('INSERTING');
        return true;
      } else {
        // Row Exists, Update
        // console.log('UPDATING');
        const updateRow = db.prepare(
          'UPDATE devicelist SET last_updated = ?, content = ? WHERE key_id = ?'
        );

        updateRow.run(params.last_updated, params.content, params.key_id);
        return true;
      }
    } catch (e) {
      if (process.env.APP_ENV === 'development') {
        console.log(e);
      }
    }
  }
}

export default DeviceList;
