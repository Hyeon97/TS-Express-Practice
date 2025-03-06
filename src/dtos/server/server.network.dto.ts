import { ServerNetwork } from "../../types/server"

// 네트워크 정보 DTO
export class NetworkInfoDTO {
  name: string
  ipAddress: string
  subNet: string
  gateWay: string
  macAddress: string
  lastUpdated: string

  constructor(network: ServerNetwork) {
    this.name = network.sNetworkName
    this.ipAddress = network.sIPAddress || "-"
    this.subNet = network.sSubnet || "-"
    this.gateWay = network.sGateway || "-"
    this.macAddress = network.sMacaddress || "-"
    this.lastUpdated = network.sLastUpdateTime || "Unknwon"
  }

  static fromEntity(network: ServerNetwork): NetworkInfoDTO {
    return new NetworkInfoDTO(network)
  }

  static fromEntities(networks: ServerNetwork[]): NetworkInfoDTO[] {
    return networks.map((network) => NetworkInfoDTO.fromEntity(network))
  }
}
