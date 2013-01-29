# modified with the help of Github:
# https://help.github.com/articles/deploying-with-capistrano
# by Shreyans Bhansali, 28 January 2013

default_run_options[:pty] = true
ssh_options[:forward_agent] = true
set :normalize_asset_timestamps, false

set :application, "massivelyoffline"
set :repository,  "git@github.com:shreyansb/massivelyoffline.git"

set :scm, :git
set :user, "ubuntu"
set :use_sudo, false

role :web, "massivelyoffline.org"                          # Your HTTP server, Apache/etc
role :app, "massivelyoffline.org"                          # This may be the same as your `Web` server

# if you want to clean up old releases on each deploy uncomment this:
after "deploy:restart", "deploy:cleanup"
after "deploy:restart", "settings:upload"

# custom tasks
namespace :settings do
    task :upload, :roles => :app do
        top.upload("server/settings.py", "#{current_path}/server", :via => :scp)
    end
end
