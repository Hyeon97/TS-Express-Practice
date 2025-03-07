import { DiskTypeLabels } from "../../types/server/server"
import { ServerDisk } from "../../types/server/server.db"
import { formatDiskSize } from "../../utils/data-convert.util"

// 디스크 정보 DTO
export class DiskInfoDTO {
  device: string
  diskType: string
  diskSize: string
  diskSizeReadable: string
  lastUpdated: string

  constructor({ sDevice, nDiskType, sDiskSize, sLastUpdateTime }: ServerDisk) {
    this.device = sDevice
    this.diskType = DiskTypeLabels[nDiskType]
    this.diskSize = `${sDiskSize} (${formatDiskSize(sDiskSize)})`
    this.diskSizeReadable = `${sDiskSize} (${formatDiskSize(sDiskSize)})`
    this.lastUpdated = sLastUpdateTime || "Unknwon"
  }

  static fromEntity(disk: ServerDisk): DiskInfoDTO {
    return new DiskInfoDTO(disk)
  }

  static fromEntities(disks: ServerDisk[]): DiskInfoDTO[] {
    return disks.map((disk) => DiskInfoDTO.fromEntity(disk))
  }
}
