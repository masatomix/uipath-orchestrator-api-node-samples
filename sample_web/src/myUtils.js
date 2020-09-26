export const isExecutable = (release, robot) => {
  // console.log(`トレイ上のプロセス名: ${release.Name}`)
  // console.log(`紐付くロボットグループ: ${release.EnvironmentName}`)
  const robotEnvironments = robot.RobotEnvironments.split(',')
  // console.log(`ロボが属するロボットグループ(配列): ${robotEnvironments}`)

  if (robotEnvironments.length > 0) {
    // ロボが属するグループ名を繰り返しチェックして、プロセスのグループ名と一致しているモノが一つでもあったらtrue/なかったらfalse
    return (
      robotEnvironments.filter(
        robotEnvironment => robotEnvironment == release.EnvironmentName,
      ).length > 0
    )
  }
  return false
}
