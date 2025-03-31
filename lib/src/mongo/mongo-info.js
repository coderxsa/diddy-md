const { backup, restore } = require('mongo-client-db'), { auto_backup_db } = require('utils-cx');
const file_restore = './database.json'
const password = 'kv8dLObQ8l3shnmt'

const url = `mongodb+srv://name:${password}@cluster0.shgob.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

// for plugins
const Backup = async (data) => {
   const response = await backup(url, data);
   console.log(response)
   return response
};
exports.Backup = Backup
const Restore = async () => {
   const response = await restore(url, file_restore, {
      save_local: true //must be true if run with command .restore
   });
   console.log(response.log)
   return response
}
exports.Restore = Restore

if (!auto_backup) {
  return //console.log('Autobackup Disable');
} else if (auto_backup) {
   const test_file = false// if autobackup no need to save test , if true test file will database-test.json
   const alert = true
   const alert_info = '✅‎ Backed Up'   
   auto_backup_db(url, file_restore, backup, restore, { alert, alert_info, test_file });
}
