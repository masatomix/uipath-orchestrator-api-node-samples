export const isEmpty = config => (config.serverinfo ? false : true)

/**
 * 与えられたConfigの状態
 */
export const getConfigState = config => {
  let isEnterprise = false
  let isCommunity = false
  let isRobot = false
  if (config.serverinfo) {
    // Enterpriseだったら、trueにする
    if (!config.serverinfo.client_id) {
      // serverinfo.client_idプロパティがなければEnterprise
      isEnterprise = true
    } else {
      //
    }
    isCommunity = !isEnterprise // Enterpriseの逆にする。

    // Enterprise/Community判定は client_id があるなしだけの判定なので、
    // client_idナシかつ robotInfoだけあれば、userinfoなくてもロボットモードで動くようにする
    if (config.robotInfo) {
      isRobot = true
    } else {
      //
    }
    console.log(isEnterprise)
    console.log(isCommunity)
    console.log(isRobot)
  }
  return { isEnterprise, isCommunity, isRobot }
}

export const getConfig = me => {
  const selectedRobotModeFlag = me.$store.state.selectedRobotModeFlag
  return {
    '0': me.$store.state.enterpriseConfig,
    '1': me.$store.state.communityConfig,
    '2': me.$store.state.jsonConfig,
  }[selectedRobotModeFlag]
}
