terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "rvlt"

    workspaces {
      name = "discord-bot"
    }
  }
}
