require 'json'
require 'redis'

REDIS = 'localhost:6379'

class Cluster

  def initialize
    @_client = {}
    @loop = true
  end

  def client server
    unless @_client.key? server
      hp = server.split(':')
      @_client[server] = Redis.new host: hp[0], port: hp[1].to_i
    end
    @_client[server]
  end

  def loop
    @loop = true
    while @loop
      task = client(REDIS).blpop 'working', 0
      if task
        queue = task[0]
        action = JSON.parse(task[1])
        args = action[1]
        answer = action[2]
        job_id = action[3]
        client(answer).something_long job_id, ['Hello from ruby'].to_json
      end
    end
  end

end

cluster = Cluster.new

cluster.loop
