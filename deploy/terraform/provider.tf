variable "do_token" {
}

variable "ssh_fingerprint" {
}

variable "ssh_private_key" {
}


provider "digitalocean" {
  token = var.do_token
}


data "digitalocean_ssh_key" "terraform" {
  name = "warranwood-1"
}
