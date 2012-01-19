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
        cmd, args, answer, job_id = JSON.parse(task[1])
        self.method(cmd.to_sym).call args, answer, job_id
      end
    end
  end

  def answer who, action, job_id, args
    client(who).send action, job_id, args.to_json
  end

end

class Test < Cluster

  def something_long args, who, job_id
    answer who, :something_long, job_id, ['Hello from ruby class']
  end

end

test = Test.new

test.loop
