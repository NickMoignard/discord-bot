
resource "digitalocean_droplet" "discord-bot" {
  image              = "ubuntu-18-04-x64"
  name               = "discord-bot"
  region             = "sfo2"
  size               = "s-1vcpu-1gb"
  private_networking = false
  monitoring         = true
  ssh_keys           = [
    data.digitalocean_ssh_key.terraform.id
  ]
  user_data          = file("user_data.yml")

  connection {
    host  = digitalocean_droplet.discord-bot.ipv4_address
    user  = "root"
    type = "ssh"
    private_key = file(var.pvt_key_path)
  }

  provisioner "remote-exec" {
    inline = [
      "cloud-init status --wait"
    ]
  }
}
