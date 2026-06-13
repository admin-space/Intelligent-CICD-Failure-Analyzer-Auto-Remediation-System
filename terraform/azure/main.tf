# Terraform configuration file for Azure landing zone setup
provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "cloudwise-rg"
  location = "East US"
}

resource "azurerm_virtual_network" "main" {
  name                = "cloudwise-vnet"
  address_space       = ["10.1.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "cloudwise-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "cloudwiseaks"

  default_node_pool {
    name       = "default"
    node_count = 1
    vm_size    = "Standard_D2_v2"
  }

  identity {
    type = "SystemAssigned"
  }
}
