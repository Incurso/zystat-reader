## (Optional) Install as a linux service
To install as as SystemD service do the following, example assumes SAT:4C was installed into /opt

### Create service user
```
sudo useradd -r zystat
```

### Grant service user ownership of sat4c directory
```
sudo chown -R zystat:zystat /opt/zystat-reader
```

### Grant permission for user/group of sat4c directory
sudo chmod -R u+rwX,go+rwX,o-w /opt/zystat-reader/

### Make index.js of sat4c server executable
sudo chmod ug+x /opt/zystat-reader/index.js

### Copy service file to SystemD
```
sudo cp /opt/zystat/config/zystat.service.example /etc/systemd/system/zystat.service
sudo systemctl enable zystat
sudo systemctl start zystat
```
