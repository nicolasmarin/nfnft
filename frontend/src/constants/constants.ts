interface ercInfo {
    name: string;
    symbol: string;
    address: string;
}

type erc20AddressesType = {
    [key: string]: ercInfo
}

export const erc20Addresses:erc20AddressesType = {
    '50':
        {
            name: "xdcX",
            symbol: "XDCX",
            address: "0x1A3c067c6c31f7Aac9e28715E0e52F99252De5d8"
        },
    '51':
        {
            name: "xdcX",
            symbol: "XDCX",
            address: "0x69c32592AFF808A59ABcB8DD1add825b8a035FAC"
        },
    '10200':
        {
            name: "CHIADOX",
            symbol: "CHIADOX",
            address: "0x19C653Da7c37c66208fbfbE8908A5051B57b4C70"
        },
    '534353':
        {
            name: "SCROLLX",
            symbol: "SCROLLX",
            address: "0x0308d0fD85913A20e7D3a013E10Ef1b09848b50c"
        },
}