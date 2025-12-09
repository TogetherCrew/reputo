function run() {
    let ok = 2
    try {
        ok = rs.status().ok
    } catch (error) {
        var config = {
            _id: 'rs0',
            members: [{ _id: 0, host: 'mongodb' }],
        }
        rs.initiate(config)
    }
    return ok
}

console.log(run())
