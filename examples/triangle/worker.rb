require 'json'
require 'redis'

redis = Redis.new

again = true

answer = nil

while again
  task = redis.blpop 'working', 0
  if task
    queue = task[0]
    action = JSON.parse(task[1])
    args = action[1]
    job_id = action[3]
    unless answer
      hp = action[2].split(':')
      answer = Redis.new host: 'localhost', port: hp[1].to_i
      #answer.connect
    end
    answer.something_long job_id, ['Hello from ruby'].to_json
  end
end
