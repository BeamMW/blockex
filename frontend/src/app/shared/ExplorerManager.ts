
export default class ExplorerManager {

  private static instance: ExplorerManager;

  currentPage = 0;
  selectedTab = null;

  static getInstance() {
    if (this.instance != null) {
      return this.instance;
    }
    this.instance = new ExplorerManager();
    return this.instance;
  }

  
}
