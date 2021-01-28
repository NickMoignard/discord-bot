
resource "digitalocean_droplet" "bot" {
  image              = "ubuntu-18-04-x64"
  name               = "bot-1"
  region             = "sfo2"
  size               = "s-1vcpu-1gb"
  private_networking = false
  monitoring         = true
  ssh_keys           = [
    data.digitalocean_ssh_key.terraform.id
  ]
  user_data          = file("../../config/user_data.yml")

  connection {
    host  = digitalocean_droplet.bot.ipv4_address
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
resource "digitalocean_firewall" "bot" {
  name = "only-22-3000"
  droplet_ids = [ digitalocean_droplet.bot.id ]

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["192.168.1.0/24", "2002:1:2::/48"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "3000"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "icmp"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "53"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "53"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
  
}
