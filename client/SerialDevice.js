module.exports = class SerialDevice {
    port = null;
    adapter = null;

    setAdapter (adapter) {
        this.adapter = adapter;
    }

    list () {
        return this.adapter.list();
        // return new Promise(() => {
        //     return Promise.resolve()
        // });
    }

    start () {
        return this.adapter.start();
    }

    drawFrame (payload) {
        for (let i in payload.payload) {
            let val = payload.payload[i];

            if (val !== 0) {
                val = val.replace(/#/, '');
              //   val = parseInt(val, 16);
              this.queue(val);
            } else {
              this.queue('000000');
            }
        }

        // this.adapter.write(frame)
        //     .then(() => console.log('Data successfully written'))
        //     .catch((err) => console.log('Error', err));
    }

    /**
     * Queue
     */
    q = [];
    running = false;
    time = null;

    queue (data) {
        this.q.push(data);
        this.time = new Date();
        this.run();
    }

    run () {
        if (this.running) {
            return;
        }

        if (this.connected === false) {
            this.start();
            return;
        }

        if (this.q.length <= 0 && this.time !== null) {
            this.running = false;
            console.log('serial queue drained after ' + ((new Date()).getTime() - this.time.getTime()) + ' msec');
            this.time = null;
            return;
        }

        if (this.q.length <= 0) {
            return;
        }

        this.running = true;
        // console.log('running queue', this.q.length);

        let val = this.q.shift();
        // console.log('writing', val);
        //  + val + '\n' + val + '\n' + val + '\n'
        this.adapter.send(val + '\n', (err, result) => {
            if (err) throw new Error(err);

            // console.log('write result (bytes):', result);
            // workaround for Abort trab: 6 issue
            setTimeout(() => {
                this.running = false;
                this.run();
            }, 1);
        });
    }
}