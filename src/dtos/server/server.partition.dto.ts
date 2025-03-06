import { ServerPartition } from "../../types/server"
import { formatDiskSize } from "../../utils/data-convert.util"

//  partition 정보 DTO
export class PartitionInfoDTO {
  size: string
  used: string
  free: string
  usage: string
  letter: string
  device: string
  fileSystem: string
  lastUpdated: string

  constructor({ nPartSize, nPartUsed, nPartFree, sLetter, sDevice, sFileSystem, sLastUpdateTime }: ServerPartition) {
    this.size = `${nPartSize} (${formatDiskSize(String(nPartSize))})`
    this.used = `${nPartUsed} (${formatDiskSize(String(nPartUsed))})`
    this.free = `${nPartFree} (${formatDiskSize(String(nPartFree))})`
    this.usage = `${((nPartUsed / nPartSize) * 100).toFixed(2)}%`
    this.letter = sLetter
    this.device = sDevice
    this.fileSystem = sFileSystem || "Unknwon"
    this.lastUpdated = sLastUpdateTime || "Unknwon"
  }

  static fromEntity(part: ServerPartition): PartitionInfoDTO {
    return new PartitionInfoDTO(part)
  }

  static fromEntities(disks: ServerPartition[]): PartitionInfoDTO[] {
    return disks.map((part) => PartitionInfoDTO.fromEntity(part))
  }
}
